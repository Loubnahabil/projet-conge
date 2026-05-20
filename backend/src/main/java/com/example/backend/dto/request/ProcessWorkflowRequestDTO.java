package com.example.backend.dto.request;

import lombok.Data;

@Data
public class ProcessWorkflowRequestDTO {
    // No longer mandatory! Optional for approvals, filled only if rejecting.
    private String commentaire;
}