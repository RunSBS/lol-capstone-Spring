package hyun;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class LoLApplication {

    public static void main(String[] args) {
        SpringApplication.run(LoLApplication.class, args);
    }

}
