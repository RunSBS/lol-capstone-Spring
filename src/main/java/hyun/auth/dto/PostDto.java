package hyun.auth.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.Instant;

import java.util.Map;

/**
 * 게시글 DTO
 */
@Getter
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.ALWAYS)
public class PostDto {
    private Long id;
    private Long userId;
    private String writer;         // 작성자 이름
    private String title;          // 제목
    private String content;        // 내용
    private String category;       // 카테고리 (free, guide, lolmuncheol)
    private Instant createdAt;     // 작성 시간
    private Instant updatedAt;     // 수정 시간
    private int like;              // 추천 수
    private int dislike;           // 반대 수
    private String writerB;        // 작성자B (롤문철 카테고리용, null 가능)
    private String matchData;       // 전적 데이터 (JSON 형식, null 가능)
    private VoteInfo vote;         // 투표 정보 (롤문철 카테고리용, null 가능)
    
    @Getter
    @AllArgsConstructor
    @JsonInclude(JsonInclude.Include.ALWAYS)
    public static class VoteInfo {
        private String question;   // 투표 질문
        private String[] options;   // 투표 옵션 (A, B)
        private Map<Integer, Integer> results; // 투표 결과 {0: votesForA, 1: votesForB}
        private String endTime;    // 투표 마감 시간 (ISO 형식)
    }
}

