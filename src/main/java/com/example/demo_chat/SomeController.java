package com.example.demo_chat;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@CrossOrigin("*")
@RestController
@RequestMapping("/dont/sleep")
public class SomeController {

    @GetMapping
    public String awake(){
        return "Sir, yes, sir!";
    }
}
