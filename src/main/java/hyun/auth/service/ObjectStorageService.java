package hyun.auth.service;

import com.oracle.bmc.Region;
import com.oracle.bmc.auth.SimpleAuthenticationDetailsProvider;
import com.oracle.bmc.objectstorage.ObjectStorageClient;
import com.oracle.bmc.objectstorage.requests.PutObjectRequest;
import com.oracle.bmc.objectstorage.responses.PutObjectResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.FileInputStream;
import java.io.InputStream;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.UUID;

@Service
@Slf4j
public class ObjectStorageService implements InitializingBean {

    @Value("${OCI_REGION:${app.oci.region:ap-chuncheon-1}}")
    private String ociRegion;
    @Value("${OCI_NAMESPACE:${app.oci.namespace:}}")
    private String namespaceName;
    @Value("${OCI_BUCKET:${app.oci.bucket:}}")
    private String bucketName;
    @Value("${OCI_TENANCY_OCID:${app.oci.tenancyOcid:}}")
    private String tenancyOcid;
    @Value("${OCI_USER_OCID:${app.oci.userOcid:}}")
    private String userOcid;
    @Value("${OCI_FINGERPRINT:${app.oci.fingerprint:}}")
    private String fingerprint;
    @Value("${OCI_PRIVATE_KEY_PATH:${app.oci.privateKeyPath:}}")
    private String privateKeyPath;

    private ObjectStorageClient client;
    private String configErrorMessage;

    @Override
    public void afterPropertiesSet() throws Exception {
        StringBuilder missing = new StringBuilder();
        if (namespaceName == null || namespaceName.isBlank()) missing.append("namespace ");
        if (bucketName == null || bucketName.isBlank()) missing.append("bucket ");
        if (tenancyOcid == null || tenancyOcid.isBlank()) missing.append("tenancyOcid ");
        if (userOcid == null || userOcid.isBlank()) missing.append("userOcid ");
        if (fingerprint == null || fingerprint.isBlank()) missing.append("fingerprint ");
        if (privateKeyPath == null || privateKeyPath.isBlank()) missing.append("privateKeyPath ");
        if (missing.length() > 0) {
            configErrorMessage = "Missing properties: " + missing.toString().trim() + " (configure app.oci.* or OCI_* env vars)";
            log.warn("OCI Object Storage is not fully configured. {} Skipping client initialization.", configErrorMessage);
            return;
        }

        // Private key 경로 확인
        File keyFile = new File(privateKeyPath);
        if (!keyFile.exists() || !keyFile.isFile()) {
            configErrorMessage = "Private key not found or unreadable at: " + privateKeyPath;
            log.warn("OCI private key not found. Skipping OCI client initialization. path={}", privateKeyPath);
            return;
        }

        SimpleAuthenticationDetailsProvider provider =
            SimpleAuthenticationDetailsProvider.builder()
                .tenantId(tenancyOcid)
                .userId(userOcid)
                .fingerprint(fingerprint)
                .privateKeySupplier(() -> {
                    try {
                        return new FileInputStream(keyFile);
                    } catch (Exception e) {
                        throw new RuntimeException("Failed to read OCI private key: " + e.getMessage(), e);
                    }
                })
                .build();

        Region region = Region.fromRegionCodeOrId(ociRegion);
        this.client = ObjectStorageClient.builder().region(region).build(provider);
        log.info("OCI ObjectStorageClient initialized for region={}, bucket={}, namespace={}", ociRegion, bucketName, namespaceName);
    }

    public String uploadPublic(MultipartFile file) {
        try {
            if (client == null) {
                String msg = (configErrorMessage != null && !configErrorMessage.isBlank())
                        ? configErrorMessage
                        : "OCI Object Storage not configured (set app.oci.* or OCI_* env vars)";
                throw new IllegalStateException(msg);
            }
            String original = file.getOriginalFilename();
            String ext = "";
            if (original != null && original.lastIndexOf('.') >= 0) {
                ext = original.substring(original.lastIndexOf('.'));
            }
            String objectName = UUID.randomUUID() + (ext);

            try (InputStream input = file.getInputStream()) {
                PutObjectRequest request = PutObjectRequest.builder()
                        .namespaceName(namespaceName)
                        .bucketName(bucketName)
                        .objectName(objectName)
                        .contentType(file.getContentType())
                        .contentLength(file.getSize())
                        .putObjectBody(input)
                        .build();

                PutObjectResponse response = client.putObject(request);
                log.info("OCI upload success: etag={}, objectName={}", response.getETag(), objectName);
            }

            String encoded = URLEncoder.encode(objectName, StandardCharsets.UTF_8);
            String publicUrl = String.format("https://objectstorage.%s.oraclecloud.com/n/%s/b/%s/o/%s",
                    ociRegion, namespaceName, bucketName, encoded);
            return publicUrl;
        } catch (Exception e) {
            log.error("OCI upload failed", e);
            throw new RuntimeException("OCI 업로드 실패: " + e.getMessage(), e);
        }
    }
}


