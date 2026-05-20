package com.example.backend.service;

import com.example.backend.exception.BusinessException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class DocumentStorageService {

    private final Path rootLocation = Paths.get("uploads");

    public DocumentStorageService() {
        try {
            // Automatically initialize the uploads directory on system booting startup
            Files.createDirectories(rootLocation);
        } catch (IOException e) {
            throw new RuntimeException("Impossible d'initialiser le dossier de stockage des fichiers", e);
        }
    }

    public String storeFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new BusinessException("Impossible de stocker un fichier vide.");
        }

        try {
            String originalFilename = file.getOriginalFilename();
            String extension = "";

            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }

            // Secure unique file hashing nomenclature to block storage collision overwrites
            String cleanedFilename = UUID.randomUUID().toString() + extension;
            Path destinationFile = this.rootLocation.resolve(Paths.get(cleanedFilename)).normalize().toAbsolutePath();

            Files.copy(file.getInputStream(), destinationFile, StandardCopyOption.REPLACE_EXISTING);

            // Return relative system URL storage path pathing reference string
            return "/uploads/" + cleanedFilename;

        } catch (IOException e) {
            throw new BusinessException("Échec du stockage du fichier sur le disque serveur.");
        }
    }
}