package com.example.backend.exception;

import java.util.Collections;
import java.util.Map;

public class BusinessException extends RuntimeException {
    private final ErrorCode errorCode;
    private final Map<String, Object> params;

    public BusinessException(String message) {
        super(message);
        this.errorCode = ErrorCode.BUSINESS_ERROR;
        this.params = Collections.emptyMap();
    }

    public BusinessException(String message, ErrorCode errorCode) {
        super(message);
        this.errorCode = errorCode;
        this.params = Collections.emptyMap();
    }

    public BusinessException(String message, ErrorCode errorCode, Map<String, Object> params) {
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
