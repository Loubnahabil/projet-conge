package com.example.backend.exception;

import java.util.Collections;
import java.util.Map;

public class ResourceNotFoundException extends RuntimeException {
    private final ErrorCode errorCode;
    private final Map<String, Object> params;

    public ResourceNotFoundException(String message) {
        super(message);
        this.errorCode = ErrorCode.RESOURCE_NOT_FOUND;
        this.params = Collections.emptyMap();
    }

    public ResourceNotFoundException(String message, ErrorCode errorCode) {
        super(message);
        this.errorCode = errorCode;
        this.params = Collections.emptyMap();
    }

    public ResourceNotFoundException(String message, ErrorCode errorCode, Map<String, Object> params) {
        super(message);
        this.errorCode = errorCode;
        this.params = params != null ? params : Collections.emptyMap();
    }

    public ErrorCode getErrorCode() {
        return errorCode;
    }

    public Map<String, Object> getParams() {
        return params;
    }
}
