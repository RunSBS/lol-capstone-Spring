package hyun.db.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

/**
 * 게시글 첨부 미디어 테이블 (POST_MEDIA)
 * - 게시글에 첨부된 이미지/영상 파일 정보 저장
 */
@Entity
@Table(name = "POST_MEDIA")
@Getter
@Setter
public class PostMedia {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "post_media_seq")
    @SequenceGenerator(name = "post_media_seq", sequenceName = "POST_MEDIA_SEQ", allocationSize = 1)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "POST_ID", nullable = false)
    private Post post;              // 연결된 게시글

    @Column(name = "FILE_URL", nullable = false, length = 500)
    private String fileUrl;        // 파일 URL (예: /api/files/filename.jpg)

    @Column(name = "FILE_NAME", nullable = false, length = 255)
    private String fileName;        // 저장된 파일명 (UUID + 확장자)

    @Column(name = "ORIGINAL_FILE_NAME", length = 255)
    private String originalFileName; // 원본 파일명

    @Column(name = "FILE_TYPE", nullable = false, length = 50)
    private String fileType;        // 파일 타입 (image, video)

    @Column(name = "CONTENT_TYPE", length = 100)
    private String contentType;     // MIME 타입 (예: image/jpeg, video/mp4)

    @Column(name = "FILE_SIZE")
    private Long fileSize;          // 파일 크기 (바이트)

    @Column(name = "CREATED_AT")
    private Instant createdAt;      // 업로드 시간
}

