package hyun.auth.service;

import hyun.auth.dto.PostDto;
import hyun.db.entity.Post;
import hyun.db.entity.PostMedia;
import hyun.db.entity.PostReaction;
import hyun.db.entity.User;
import hyun.db.entity.Bet;
import hyun.db.repo.BetRepository;
import hyun.db.repo.PostMediaRepository;
import hyun.db.repo.PostReactionRepository;
import hyun.db.repo.PostRepository;
import hyun.db.repo.UserRepository;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
@RequiredArgsConstructor
@Slf4j
public class PostService {
    private final PostRepository posts;
    private final UserRepository users;
    private final PostReactionRepository reactions;
    private final BetService betService;
    private final BetRepository betRepository;
    private final PostMediaRepository postMediaRepository;

    private User me() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getPrincipal() == null) {
            log.error("No authentication found");
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "인증 정보 없음");
        }
        log.info("Authentication: {}, Principal: {}", auth.getName(), auth.getPrincipal());
        String username = auth.getName(); // Principal이 아닌 getName() 사용
        log.info("Username from auth: {}", username);
        User user = users.findByUsername(username).orElseThrow();
        log.info("Found user: {}", user.getUsername());
        return user;
    }

    @Transactional
    public Post create(String title, String content, String category, String writerB, 
                      String betTitle, String optionA, String optionB, String endTime, 
                      Map<String, Object> matchData) {
        User u = me();
        log.info("Creating post for user: {}, category: {}", u.getUsername(), category);
        Post p = new Post();
        p.setUser(u);
        p.setUserId(u.getId()); // USER_ID 컬럼도 설정
        p.setTitle(title);
        p.setContent(content);
        p.setCategory(category != null ? category : "free"); // 기본값 free
        
        // 롤문철 카테고리일 때 writerB 저장
        if ("lolmuncheol".equals(category) && writerB != null && !writerB.isEmpty()) {
            p.setWriterB(writerB);
            log.info("writerB 저장: {}", writerB);
        }
        
        // matchData가 있으면 JSON 문자열로 변환하여 저장
        if (matchData != null && !matchData.isEmpty()) {
            try {
                ObjectMapper objectMapper = new ObjectMapper();
                String matchDataJson = objectMapper.writeValueAsString(matchData);
                p.setMatchData(matchDataJson);
                log.info("MatchData 저장: {}", matchDataJson);
            } catch (Exception e) {
                log.warn("MatchData JSON 변환 실패: {}", e.getMessage(), e);
            }
        } else {
            log.info("MatchData가 null이거나 비어있음: matchData={}", matchData);
        }
        
        p.setCreatedAt(Instant.now());
        log.info("Post object before save: user={}, userId={}, title={}, category={}", p.getUser().getUsername(), p.getUserId(), p.getTitle(), p.getCategory());
        Post saved = posts.save(p);
        log.info("Post saved with ID: {}, author: {}", saved.getId(), saved.getUser().getUsername());
        
        // content에서 미디어 파일 URL 추출하여 PostMedia에 저장
        savePostMedia(saved, content);
        
        // 롤문철 카테고리일 때 자동으로 Bet 생성
        if ("lolmuncheol".equals(category)) {
            try {
                // deadline 파싱 (endTime이 있으면 사용, 없으면 기본값)
                Instant deadline = null;
                if (endTime != null && !endTime.isEmpty()) {
                    try {
                        // datetime-local 형식 파싱 (예: "2024-01-01T12:00")
                        String timeStr = endTime.trim();
                        // LocalDateTime.parse()는 ISO_LOCAL_DATE_TIME 형식을 기본으로 사용
                        // "YYYY-MM-DDTHH:mm" 또는 "YYYY-MM-DDTHH:mm:ss" 형식 지원
                        deadline = LocalDateTime.parse(timeStr).atZone(ZoneId.systemDefault()).toInstant();
                        log.info("endTime 파싱 성공: {} -> {}", endTime, deadline);
                    } catch (Exception e) {
                        log.warn("endTime 파싱 실패: {}, 기본값 사용", endTime, e);
                    }
                }
                
                // Bet 생성
                betService.createBet(
                    saved,
                    u,
                    writerB != null ? writerB : u.getUsername(), // writerB가 없으면 작성자로 설정
                    betTitle,
                    optionA,
                    optionB,
                    deadline
                );
                log.info("Bet 자동 생성 완료: postId={}", saved.getId());
            } catch (Exception e) {
                log.error("Bet 생성 실패: postId={}, error={}", saved.getId(), e.getMessage(), e);
                // Bet 생성 실패해도 Post는 생성됨 (롤백하지 않음)
            }
        }
        
        return saved;
    }

    /**
     * content에서 미디어 파일 URL을 추출하여 PostMedia 테이블에 저장
     */
    private void savePostMedia(Post post, String content) {
        if (content == null || content.isEmpty()) {
            return;
        }

        // PostMedia 테이블이 없을 수 있으므로 안전하게 처리
        try {
            // img 태그에서 src 추출 (data-media-id 속성이 있는 경우만)
            Pattern imgPattern = Pattern.compile(
                "<img[^>]*data-media-type=\"image\"[^>]*src=\"([^\"]+)\"[^>]*data-media-id=\"([^\"]+)\"",
                Pattern.CASE_INSENSITIVE
            );
            
            // video 태그에서 src 추출 (data-media-type 속성이 있는 경우만)
            Pattern videoPattern = Pattern.compile(
                "<video[^>]*data-media-type=\"video\"[^>]*src=\"([^\"]+)\"[^>]*data-media-id=\"([^\"]+)\"",
                Pattern.CASE_INSENSITIVE
            );
            
            // span 태그 안의 video (data-video-url 속성)
            Pattern spanVideoPattern = Pattern.compile(
                "<span[^>]*data-media-type=\"video\"[^>]*data-video-url=\"([^\"]+)\"[^>]*data-media-id=\"([^\"]+)\"",
                Pattern.CASE_INSENSITIVE
            );

            // img 태그 처리
            Matcher imgMatcher = imgPattern.matcher(content);
            while (imgMatcher.find()) {
                String fileUrl = imgMatcher.group(1);
                String mediaId = imgMatcher.group(2);
                
                // 서버에 업로드된 파일만 저장 (/api/files/로 시작하는 경우)
                if (fileUrl != null && fileUrl.startsWith("/api/files/")) {
                    saveMediaFile(post, fileUrl, mediaId, "image");
                }
            }

            // video 태그 처리
            Matcher videoMatcher = videoPattern.matcher(content);
            while (videoMatcher.find()) {
                String fileUrl = videoMatcher.group(1);
                String mediaId = videoMatcher.group(2);
                
                if (fileUrl != null && fileUrl.startsWith("/api/files/")) {
                    saveMediaFile(post, fileUrl, mediaId, "video");
                }
            }

            // span 태그 안의 video 처리
            Matcher spanVideoMatcher = spanVideoPattern.matcher(content);
            while (spanVideoMatcher.find()) {
                String fileUrl = spanVideoMatcher.group(1);
                String mediaId = spanVideoMatcher.group(2);
                
                if (fileUrl != null && fileUrl.startsWith("/api/files/")) {
                    saveMediaFile(post, fileUrl, mediaId, "video");
                }
            }

        } catch (Exception e) {
            log.warn("미디어 파일 정보 저장 실패: {}", e.getMessage());
        }
    }

    /**
     * PostMedia 엔티티 생성 및 저장
     */
    private void saveMediaFile(Post post, String fileUrl, String mediaId, String fileType) {
        try {
            // 파일명 추출 (/api/files/filename.jpg -> filename.jpg)
            String fileName = fileUrl.substring(fileUrl.lastIndexOf("/") + 1);
            
            // 파일명에서 확장자 추출하여 contentType 추정
            String contentType = "application/octet-stream";
            if (fileName.contains(".")) {
                String ext = fileName.substring(fileName.lastIndexOf(".") + 1).toLowerCase();
                if (fileType.equals("image")) {
                    switch (ext) {
                        case "jpg":
                        case "jpeg":
                            contentType = "image/jpeg";
                            break;
                        case "png":
                            contentType = "image/png";
                            break;
                        case "gif":
                            contentType = "image/gif";
                            break;
                        case "webp":
                            contentType = "image/webp";
                            break;
                    }
                } else if (fileType.equals("video")) {
                    if (ext.equals("mp4")) {
                        contentType = "video/mp4";
                    }
                }
            }

            PostMedia postMedia = new PostMedia();
            postMedia.setPost(post);
            postMedia.setFileUrl(fileUrl);
            postMedia.setFileName(fileName);
            postMedia.setOriginalFileName(mediaId); // 임시로 mediaId 사용
            postMedia.setFileType(fileType);
            postMedia.setContentType(contentType);
            postMedia.setFileSize(0L); // 파일 크기는 나중에 업데이트 가능
            postMedia.setCreatedAt(Instant.now());

            postMediaRepository.save(postMedia);
            log.info("PostMedia 저장 완료: postId={}, fileUrl={}, fileType={}", post.getId(), fileUrl, fileType);

        } catch (Exception e) {
            log.warn("PostMedia 저장 실패: postId={}, fileUrl={}, error={}", post.getId(), fileUrl, e.getMessage());
        }
    }

    @Transactional
    public Post update(Long postId, String title, String content, String contentB) {
        User u = me();
        Post p = posts.findById(postId).orElseThrow();
        
        // 롤문철 카테고리인 경우 작성자 B도 수정 가능
        boolean canEdit = false;
        if ("lolmuncheol".equals(p.getCategory())) {
            // 작성자 A 또는 작성자 B일 때 수정 가능
            boolean isWriterA = p.getUser().getId().equals(u.getId());
            boolean isWriterB = p.getWriterB() != null && p.getWriterB().equals(u.getUsername());
            canEdit = isWriterA || isWriterB;
            
            if (canEdit) {
                if (isWriterA) {
                    // 작성자 A는 제목과 왼쪽 본문(content)만 수정
                    p.setTitle(title);
                    p.setContent(content);
                } else if (isWriterB) {
                    // 작성자 B는 오른쪽 본문(contentB)만 수정
                    if (contentB != null) {
                        p.setContentB(contentB);
                    }
                }
            }
        } else {
            // 일반 카테고리는 작성자만 수정 가능
            canEdit = p.getUser().getId().equals(u.getId());
            if (canEdit) {
                p.setTitle(title);
                p.setContent(content);
            }
        }
        
        if (!canEdit) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "수정 권한이 없습니다");
        }
        
        p.setUpdatedAt(Instant.now());
        
        // 기존 미디어 파일 삭제 후 새로운 미디어 파일 저장
        try {
            postMediaRepository.deleteByPostId(postId);
            // 작성자 A가 수정하는 경우 content의 미디어 파일 저장
            if (p.getUser().getId().equals(u.getId())) {
                savePostMedia(p, content);
            } else if (contentB != null) {
                // 작성자 B가 수정하는 경우 contentB의 미디어 파일 저장
                savePostMedia(p, contentB);
            }
        } catch (Exception e) {
            log.warn("미디어 파일 정보 업데이트 중 오류 (무시): {}", e.getMessage());
        }
        
        return posts.save(p);
    }

    @Transactional
    public void delete(Long postId) {
        User u = me();
        Post p = posts.findById(postId).orElseThrow();
        if (!p.getUser().getId().equals(u.getId())) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "작성자만 삭제 가능");
        
        // 게시글 삭제 시 연결된 미디어 파일 정보도 삭제
        try {
            postMediaRepository.deleteByPostId(postId);
        } catch (Exception e) {
            log.warn("미디어 파일 정보 삭제 중 오류 (무시): {}", e.getMessage());
        }
        
        posts.delete(p);
    }

    public PostDto findById(Long id) {
        log.info("findById called with id: {}", id);
        
        try {
            Post p = posts.findById(id).orElseThrow(() -> {
                log.warn("Post not found: {}", id);
                return new ResponseStatusException(HttpStatus.NOT_FOUND, "게시글 없음");
            });
            
            // User 정보 가져오기
            String writer = "Unknown";
            try {
                if (p.getUser() != null) {
                    writer = p.getUser().getUsername();
                }
            } catch (Exception e) {
                log.warn("Error getting writer for post {}: {}", id, e.getMessage());
            }
            
            // 좋아요/싫어요 개수 가져오기
            int likeCount = 0;
            int dislikeCount = 0;
            try {
                var reactionOpt = reactions.findByPost_Id(id);
                if (reactionOpt.isPresent()) {
                    PostReaction reaction = reactionOpt.get();
                    likeCount = reaction.getLikes() != null ? reaction.getLikes().intValue() : 0;
                    dislikeCount = reaction.getDislikes() != null ? reaction.getDislikes().intValue() : 0;
                }
            } catch (Exception e) {
                log.warn("Error getting reaction for post {}: {}", id, e.getMessage());
            }
            
            // Post 엔티티에서 직접 writerB와 contentB 가져오기
            String writerB = p.getWriterB();  // Post 엔티티에서 직접 가져오기
            String contentB = p.getContentB(); // Post 엔티티에서 직접 가져오기
            
            // Bet 정보에서 vote 정보 가져오기 (롤문철 카테고리인 경우)
            PostDto.VoteInfo voteInfo = null;
            if ("lolmuncheol".equals(p.getCategory())) {
                log.info("롤문철 게시글 처리 시작: postId={}, title={}, writerB={}", id, p.getTitle(), writerB);
                try {
                    var betOpt = betRepository.findByPost_Id(id);
                    log.info("Bet 조회 결과: postId={}, isPresent={}", id, betOpt.isPresent());
                    if (betOpt.isPresent()) {
                        Bet bet = betOpt.get();
                        
                        // Vote 정보 구성
                        Map<Integer, Integer> results = new HashMap<>();
                        try {
                            results.put(0, bet.getVotesForA() != null ? bet.getVotesForA().intValue() : 0);
                            results.put(1, bet.getVotesForB() != null ? bet.getVotesForB().intValue() : 0);
                            log.info("Vote results 구성 완료: {}", results);
                        } catch (Exception e) {
                            log.warn("Error getting vote counts for post {}: {}", id, e.getMessage());
                            results.put(0, 0);
                            results.put(1, 0);
                        }
                        
                        try {
                            voteInfo = new PostDto.VoteInfo(
                                    bet.getBetTitle() != null ? bet.getBetTitle() : "",
                                    new String[]{
                                        bet.getOptionA() != null ? bet.getOptionA() : "",
                                        bet.getOptionB() != null ? bet.getOptionB() : ""
                                    },
                                    results,
                                    bet.getDeadline() != null ? bet.getDeadline().toString() : null
                            );
                            log.info("VoteInfo 생성 완료: question={}, options={}, results={}", 
                                voteInfo.getQuestion(), java.util.Arrays.toString(voteInfo.getOptions()), voteInfo.getResults());
                        } catch (Exception e) {
                            log.warn("Error creating VoteInfo for post {}: {}", id, e.getMessage(), e);
                        }
                    } else {
                        log.warn("롤문철 게시글이지만 Bet 정보가 없음: postId={}, title={}", id, p.getTitle());
                        // Bet이 없어도 기본 VoteInfo 생성 (투표 기능 활성화된 상태로 표시)
                        try {
                            Map<Integer, Integer> defaultResults = new HashMap<>();
                            defaultResults.put(0, 0);
                            defaultResults.put(1, 0);
                            voteInfo = new PostDto.VoteInfo(
                                "투표를 시작해보세요!",
                                new String[]{"옵션 A", "옵션 B"},
                                defaultResults,
                                null
                            );
                            log.info("Bet 없음 - 기본 VoteInfo 생성: postId={}", id);
                        } catch (Exception e2) {
                            log.error("기본 VoteInfo 생성 실패: postId={}", id, e2);
                        }
                    }
                } catch (Exception e) {
                    log.error("Error getting bet info for post {}: {}", id, e.getMessage(), e);
                    // 에러 발생 시에도 기본 VoteInfo 생성
                    try {
                        Map<Integer, Integer> defaultResults = new HashMap<>();
                        defaultResults.put(0, 0);
                        defaultResults.put(1, 0);
                        voteInfo = new PostDto.VoteInfo(
                            "투표를 시작해보세요!",
                            new String[]{"옵션 A", "옵션 B"},
                            defaultResults,
                            null
                        );
                    } catch (Exception e2) {
                        log.error("기본 VoteInfo 생성 실패: postId={}", id, e2);
                    }
                }
            }
            
            // matchData 안전하게 가져오기 (큰 CLOB 데이터 처리)
            String matchDataStr = null;
            try {
                matchDataStr = p.getMatchData();
                if (matchDataStr != null) {
                    // CLOB이 너무 크면 일부만 로깅
                    String logStr = matchDataStr.length() > 100 ? 
                        matchDataStr.substring(0, 100) + "..." : matchDataStr;
                    log.info("MatchData 로드 성공: postId={}, length={}, preview={}", 
                        id, matchDataStr.length(), logStr);
                }
            } catch (Exception e) {
                log.warn("MatchData 로드 실패: postId={}, error={}", id, e.getMessage());
                matchDataStr = null; // 실패해도 계속 진행
            }
            
            // PostDto 생성 시 null 체크 강화
            PostDto dto;
            try {
                dto = new PostDto(
                        p.getId() != null ? p.getId() : id,
                        p.getUserId() != null ? p.getUserId() : 0L,
                        writer,
                        p.getTitle() != null ? p.getTitle() : "",
                        p.getContent() != null ? p.getContent() : "",
                        p.getCategory() != null ? p.getCategory() : "",
                        p.getCreatedAt() != null ? p.getCreatedAt() : Instant.now(),
                        p.getUpdatedAt() != null ? p.getUpdatedAt() : Instant.now(),
                        likeCount,
                        dislikeCount,
                        writerB,
                        contentB,
                        matchDataStr,
                        voteInfo
                );
            } catch (Exception e) {
                log.error("PostDto 생성 실패: postId={}, error={}", id, e.getMessage(), e);
                // 최소한의 정보로 기본 DTO 생성
                dto = new PostDto(
                        id,
                        0L,
                        "Unknown",
                        "",
                        "",
                        "",
                        Instant.now(),
                        Instant.now(),
                        0,
                        0,
                        null,
                        null,
                        null,
                        null
                );
            }
            
            if ("lolmuncheol".equals(p.getCategory())) {
                log.info("롤문철 PostDto 생성: postId={}, voteInfo={}", id, voteInfo != null ? "존재" : "null");
            }
            
            return dto;
        } catch (ResponseStatusException e) {
            log.error("ResponseStatusException in findById: postId={}, error={}", id, e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error in findById: postId={}, error={}", id, e.getMessage(), e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "게시글 조회 중 오류가 발생했습니다: " + e.getMessage());
        }
    }

    public List<PostDto> findAll(String category) {
        log.info("findAll called with category: {}", category);
        
        List<PostDto> result = new java.util.ArrayList<>();
        
        try {
            // category가 "all"이거나 null이면 모든 게시글 반환
            List<Post> postList = new java.util.ArrayList<>();
            try {
                log.info("DB에서 게시글 조회 시작...");
                List<Post> allPosts = posts.findAll();
                log.info("DB에서 {} 개 게시글 조회 완료", allPosts.size());
                
                if (category == null || category.isEmpty() || "all".equalsIgnoreCase(category)) {
                    postList = allPosts.stream()
                            .sorted((a, b) -> {
                                if (a.getCreatedAt() == null || b.getCreatedAt() == null) {
                                    return 0;
                                }
                                return b.getCreatedAt().compareTo(a.getCreatedAt());
                            })
                            .collect(java.util.stream.Collectors.toList());
                } else {
                    // 특정 카테고리 필터링
                    postList = allPosts.stream()
                            .filter(p -> category.equals(p.getCategory()))
                            .sorted((a, b) -> {
                                if (a.getCreatedAt() == null || b.getCreatedAt() == null) {
                                    return 0;
                                }
                                return b.getCreatedAt().compareTo(a.getCreatedAt());
                            })
                            .collect(java.util.stream.Collectors.toList());
                }
                log.info("필터링 후 {} 개 게시글", postList.size());
            } catch (Exception e) {
                log.error("Error fetching posts from database: {}", e.getMessage(), e);
                e.printStackTrace();
                return result; // 빈 리스트 반환
            }
            
            log.info("Found {} posts to process", postList.size());
            
            // 리스트로 먼저 변환한 후 DTO 변환
            for (Post p : postList) {
                try {
                    // User 정보 먼저 로드 (lazy loading 방지)
                    String writer = "Unknown";
                    try {
                        if (p.getUser() != null) {
                            writer = p.getUser().getUsername();
                        }
                    } catch (Exception e) {
                        log.warn("Error getting writer for post {}: {}", p.getId(), e.getMessage());
                    }
                    
                    // 좋아요/싫어요 개수 가져오기
                    int likeCount = 0;
                    int dislikeCount = 0;
                    try {
                        var reactionOpt = reactions.findByPost_Id(p.getId());
                        if (reactionOpt.isPresent()) {
                            PostReaction reaction = reactionOpt.get();
                            likeCount = reaction.getLikes() != null ? reaction.getLikes().intValue() : 0;
                            dislikeCount = reaction.getDislikes() != null ? reaction.getDislikes().intValue() : 0;
                        }
                    } catch (Exception e) {
                        log.warn("Error getting reaction for post {}: {}", p.getId(), e.getMessage());
                    }
                    
                    // Post 엔티티에서 직접 writerB와 contentB 가져오기
                    String writerB = p.getWriterB();  // Post 엔티티에서 직접 가져오기
                    String contentB = p.getContentB(); // Post 엔티티에서 직접 가져오기
                    
                    // Bet 정보에서 vote 정보 가져오기 (롤문철 카테고리인 경우)
                    PostDto.VoteInfo voteInfo = null;
                    if ("lolmuncheol".equals(p.getCategory())) {
                        log.info("롤문철 게시글 처리 시작: postId={}, title={}, writerB={}", p.getId(), p.getTitle(), writerB);
                        try {
                            var betOpt = betRepository.findByPost_Id(p.getId());
                            log.info("Bet 조회 결과: postId={}, isPresent={}", p.getId(), betOpt.isPresent());
                            if (betOpt.isPresent()) {
                                Bet bet = betOpt.get();
                                log.info("Bet 정보: postId={}, betTitle={}, optionA={}, optionB={}, votesForA={}, votesForB={}", 
                                    p.getId(), bet.getBetTitle(), bet.getOptionA(), bet.getOptionB(), 
                                    bet.getVotesForA(), bet.getVotesForB());
                                
                                // Vote 정보 구성
                                Map<Integer, Integer> results = new HashMap<>();
                                try {
                                    results.put(0, bet.getVotesForA() != null ? bet.getVotesForA().intValue() : 0);
                                    results.put(1, bet.getVotesForB() != null ? bet.getVotesForB().intValue() : 0);
                                    log.info("Vote results 구성 완료: {}", results);
                                } catch (Exception e) {
                                    log.warn("Error getting vote counts for post {}: {}", p.getId(), e.getMessage());
                                    results.put(0, 0);
                                    results.put(1, 0);
                                }
                                
                                try {
                                    voteInfo = new PostDto.VoteInfo(
                                            bet.getBetTitle() != null ? bet.getBetTitle() : "",
                                            new String[]{
                                                bet.getOptionA() != null ? bet.getOptionA() : "",
                                                bet.getOptionB() != null ? bet.getOptionB() : ""
                                            },
                                            results,
                                            bet.getDeadline() != null ? bet.getDeadline().toString() : null
                                    );
                                    log.info("VoteInfo 생성 완료: question={}, options={}, results={}", 
                                        voteInfo.getQuestion(), java.util.Arrays.toString(voteInfo.getOptions()), voteInfo.getResults());
                                } catch (Exception e) {
                                    log.warn("Error creating VoteInfo for post {}: {}", p.getId(), e.getMessage(), e);
                                }
                            } else {
                                log.warn("롤문철 게시글이지만 Bet 정보가 없음: postId={}, title={}", p.getId(), p.getTitle());
                                // Bet이 없어도 기본 VoteInfo 생성 (투표 기능 활성화된 상태로 표시)
                                try {
                                    Map<Integer, Integer> defaultResults = new HashMap<>();
                                    defaultResults.put(0, 0);
                                    defaultResults.put(1, 0);
                                    voteInfo = new PostDto.VoteInfo(
                                        "투표를 시작해보세요!",
                                        new String[]{"옵션 A", "옵션 B"},
                                        defaultResults,
                                        null
                                    );
                                    log.info("Bet 없음 - 기본 VoteInfo 생성: postId={}", p.getId());
                                } catch (Exception e2) {
                                    log.error("기본 VoteInfo 생성 실패: postId={}", p.getId(), e2);
                                }
                            }
                        } catch (Exception e) {
                            log.error("Error getting bet info for post {}: {}", p.getId(), e.getMessage(), e);
                            // 에러 발생 시에도 기본 VoteInfo 생성
                            try {
                                Map<Integer, Integer> defaultResults = new HashMap<>();
                                defaultResults.put(0, 0);
                                defaultResults.put(1, 0);
                                voteInfo = new PostDto.VoteInfo(
                                    "투표를 시작해보세요!",
                                    new String[]{"옵션 A", "옵션 B"},
                                    defaultResults,
                                    null
                                );
                            } catch (Exception e2) {
                                log.error("기본 VoteInfo 생성 실패: postId={}", p.getId(), e2);
                            }
                        }
                    }
                    
                    PostDto dto = new PostDto(
                            p.getId(),
                            p.getUserId(),
                            writer,
                            p.getTitle() != null ? p.getTitle() : "",
                            p.getContent() != null ? p.getContent() : "",
                            p.getCategory() != null ? p.getCategory() : "",
                            p.getCreatedAt(),
                            p.getUpdatedAt(),
                            likeCount,
                            dislikeCount,
                            writerB,
                            contentB,
                            p.getMatchData() != null ? p.getMatchData() : null,
                            voteInfo
                    );
                    if ("lolmuncheol".equals(p.getCategory())) {
                        log.info("롤문철 PostDto 생성: postId={}, voteInfo={}, voteInfo 타입={}", 
                            p.getId(), voteInfo != null ? "존재" : "null",
                            voteInfo != null ? voteInfo.getClass().getSimpleName() : "null");
                    }
                    result.add(dto);
                } catch (Exception e) {
                    log.error("Error processing post {}: {}", p.getId(), e.getMessage(), e);
                    // 개별 게시글 오류는 무시하고 기본값으로 처리
                    try {
                        result.add(new PostDto(
                                p.getId(),
                                p.getUserId() != null ? p.getUserId() : 0L,
                                "Unknown",
                                p.getTitle() != null ? p.getTitle() : "",
                                p.getContent() != null ? p.getContent() : "",
                                p.getCategory() != null ? p.getCategory() : "",
                                p.getCreatedAt() != null ? p.getCreatedAt() : Instant.now(),
                                p.getUpdatedAt() != null ? p.getUpdatedAt() : Instant.now(),
                                0,
                                0,
                                null,
                                null,
                                null,
                                null
                        ));
                    } catch (Exception e2) {
                        log.error("Failed to create default PostDto for post {}: {}", p.getId(), e2.getMessage());
                        // 최후의 수단: 이 게시글은 건너뛰기
                    }
                }
            }
            
            log.info("Successfully processed {} posts", result.size());
            return result;
        } catch (Exception e) {
            log.error("Error in findAll: {}", e.getMessage(), e);
            // 트랜잭션 롤백을 방지하기 위해 빈 리스트 반환
            return new java.util.ArrayList<>();
        }
    }
}
