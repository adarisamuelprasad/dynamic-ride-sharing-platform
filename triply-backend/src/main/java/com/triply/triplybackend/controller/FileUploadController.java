package com.triply.triplybackend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@RestController
@RequestMapping("/api/upload")
// @CrossOrigin managed by SecurityConfig
public class FileUploadController {

    // Simple local storage for demonstration
    private final Path fileStorageLocation;

    public FileUploadController() {
        this.fileStorageLocation = Paths.get("uploads").toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.fileStorageLocation);
        } catch (Exception ex) {
            throw new RuntimeException("Could not create the directory where the uploaded files will be stored.", ex);
        }
    }

    @PostMapping
    public ResponseEntity<?> uploadFile(@RequestParam("file") MultipartFile file) {
        try {
            // Validate file
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body("Please select a file to upload");
            }

            // Validate file size (10MB max)
            if (file.getSize() > 10 * 1024 * 1024) {
                return ResponseEntity.badRequest().body("File size exceeds maximum limit of 10MB");
            }

            // Validate file type (images only)
            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                return ResponseEntity.badRequest().body("Only image files are allowed");
            }

            // Clean path
            String originalFileName = StringUtils.cleanPath(file.getOriginalFilename());

            // Validate filename
            if (originalFileName.contains("..")) {
                return ResponseEntity.badRequest().body("Invalid file path");
            }

            // Generate unique name to prevent collisions
            String fileName = UUID.randomUUID().toString() + "_" + originalFileName;

            // Copy file to the target location (Replacing existing file with the same name)
            Path targetLocation = this.fileStorageLocation.resolve(fileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            // Generate URL (Assuming serving static content from /uploads)
            String fileDownloadUri = ServletUriComponentsBuilder.fromCurrentContextPath()
                    .path("/uploads/")
                    .path(fileName)
                    .toUriString();

            System.out.println("File uploaded successfully: " + fileName + " -> " + fileDownloadUri);

            return ResponseEntity
                    .ok(new UploadResponse(fileName, fileDownloadUri, file.getContentType(), file.getSize()));
        } catch (IOException ex) {
            ex.printStackTrace();
            return ResponseEntity.status(500).body("Could not upload file: " + ex.getMessage());
        } catch (Exception ex) {
            ex.printStackTrace();
            return ResponseEntity.status(500).body("Unexpected error: " + ex.getMessage());
        }
    }

    // Response DTO
    static class UploadResponse {
        private String fileName;
        private String fileUrl;
        private String fileType;
        private long size;

        public UploadResponse(String fileName, String fileUrl, String fileType, long size) {
            this.fileName = fileName;
            this.fileUrl = fileUrl;
            this.fileType = fileType;
            this.size = size;
        }

        public String getFileName() {
            return fileName;
        }

        public String getFileUrl() {
            return fileUrl;
        }

        public String getFileType() {
            return fileType;
        }

        public long getSize() {
            return size;
        }
    }
}
