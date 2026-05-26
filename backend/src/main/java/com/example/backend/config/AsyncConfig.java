package com.example.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;

@Configuration
@EnableAsync
public class AsyncConfig {
    // Enables @Async on EmailService so emails never block the HTTP response.
    // Spring will use its default SimpleAsyncTaskExecutor.
    // For production you'd configure a ThreadPoolTaskExecutor here,
    // but for this project the default is sufficient.
}