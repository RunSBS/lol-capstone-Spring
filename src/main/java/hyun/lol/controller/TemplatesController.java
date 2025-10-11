package hyun.lol.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class TemplatesController {
    @GetMapping("/search")
    public String search() {
        return "search";
    }
}
