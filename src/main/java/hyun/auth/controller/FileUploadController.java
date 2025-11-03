package hyun.auth.controller;

import hyun.auth.service.ObjectStorageService;
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

    private final ObjectStorageService objectStorageService;

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    @PostMapping(value = "/api/upload/media", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, String>> uploadMedia(@RequestParam("file") MultipartFile file) {
        // 파일 유효성 검증
        if (file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "파일이 비어있습니다.");
        }

        String contentType = file.getContentType();
        if (contentType == null || (!contentType.startsWith("image/") && !contentType.startsWith("video/"))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "이미지 또는 비디오 파일만 업로드할 수 있습니다.");
        }

        long maxSize = 50L * 1024 * 1024; // 50MB
        if (file.getSize() > maxSize) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "파일 크기는 50MB를 초과할 수 없습니다.");
        }

        // OCI 업로드
        String url = objectStorageService.uploadPublic(file);

        Map<String, String> response = new HashMap<>();
        response.put("url", url);
        response.put("originalFilename", file.getOriginalFilename() != null ? file.getOriginalFilename() : "");
        response.put("contentType", contentType);
        response.put("size", String.valueOf(file.getSize()));

        log.info("파일 업로드 성공(OCI): {}", url);
        return ResponseEntity.ok(response);
    }

    // 로컬 파일 조회(이전 게시물 호환용)
    @GetMapping(value = "/api/files/{filename:.+}")
    public ResponseEntity<byte[]> getFile(@PathVariable String filename) {
        try {
            Path filePath = Paths.get(uploadDir).resolve(filename).normalize();

            if (!filePath.startsWith(Paths.get(uploadDir).normalize())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "접근할 수 없는 파일입니다.");
            }

            if (!Files.exists(filePath)) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "파일을 찾을 수 없습니다.");
            }

            byte[] fileContent = Files.readAllBytes(filePath);
            String detected = Files.probeContentType(filePath);
            String ct = detected != null ? detected : "application/octet-stream";

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(ct))
                    .body(fileContent);

        } catch (IOException e) {
            log.error("파일 조회 실패", e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "파일 조회 실패");
        }
    }
}

