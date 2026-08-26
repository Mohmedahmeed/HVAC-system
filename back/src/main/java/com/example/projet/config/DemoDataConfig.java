package com.example.projet.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@Profile("demo")
public class DemoDataConfig {

    @Bean
    CommandLineRunner initDatabase(DemoDataSeeder demoDataSeeder, PasswordEncoder passwordEncoder) {
        return args -> demoDataSeeder.seed(passwordEncoder);
    }
}
