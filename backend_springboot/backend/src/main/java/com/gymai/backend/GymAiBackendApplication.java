package com.gymai.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@EnableScheduling
@SpringBootApplication
public class GymAiBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(GymAiBackendApplication.class, args);
	}

}
