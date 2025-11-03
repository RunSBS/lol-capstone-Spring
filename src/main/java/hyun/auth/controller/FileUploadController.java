package hyun.auth.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@Slf4j
public class FileUploadController {

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    @PostMapping(value = "/api/upload/media", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, String>> uploadMedia(@RequestParam("file") MultipartFile file) {
        try {
            // 파일 유효성 검증
            if (file.isEmpty()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "파일이 비어있습니다.");
            }

            // 파일 타입 검증 (이미지 또는 비디오)
            String contentType = file.getContentType();
            if (contentType == null || (!contentType.startsWith("image/") && !contentType.startsWith("video/"))) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "이미지 또는 비디오 파일만 업로드할 수 있습니다.");
            }

            // 파일 크기 제한 (10MB)
            long maxSize = 10 * 1024 * 1024; // 10MB
            if (file.getSize() > maxSize) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "파일 크기는 10MB를 초과할 수 없습니다.");
            }

            // 업로드 디렉토리 생성
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // 고유한 파일명 생성
            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            String uniqueFilename = UUID.randomUUID().toString() + extension;

            // 파일 저장
            Path filePath = uploadPath.resolve(uniqueFilename);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            // 파일 URL 생성
            String fileUrl = "/api/files/" + uniqueFilename;

            Map<String, String> response = new HashMap<>();
            response.put("url", fileUrl);
            response.put("filename", uniqueFilename);
            response.put("originalFilename", originalFilename != null ? originalFilename : "");
            response.put("contentType", contentType);
            response.put("size", String.valueOf(file.getSize()));

            log.info("파일 업로드 성공: {}", fileUrl);
            return ResponseEntity.ok(response);

        } catch (IOException e) {
            log.error("파일 업로드 실패", e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "파일 업로드 실패: " + e.getMessage());
        }
    }

    @GetMapping(value = "/api/files/{filename:.+}")
    public ResponseEntity<byte[]> getFile(@PathVariable String filename) {
        try {
            Path filePath = Paths.get(uploadDir).resolve(filename).normalize();
            
            // 보안 검증: 업로드 디렉토리 외부 접근 방지
            if (!filePath.startsWith(Paths.get(uploadDir).normalize())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "접근할 수 없는 파일입니다.");
            }

            if (!Files.exists(filePath)) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "파일을 찾을 수 없습니다.");
            }

            byte[] fileContent = Files.readAllBytes(filePath);
            String contentType = Files.probeContentType(filePath);
            
            if (contentType == null) {
                contentType = "application/octet-stream";
            }

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .body(fileContent);

        } catch (IOException e) {
            log.error("파일 조회 실패", e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "파일 조회 실패");
        }
    }
}

