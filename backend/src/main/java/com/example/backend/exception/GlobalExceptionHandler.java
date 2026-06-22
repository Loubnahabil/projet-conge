package com.example.backend.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.InternalAuthenticationServiceException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private Map<String, Object> buildBody(String errorCode, String message, Map<String, Object> params) {
        Map<String, Object> body = new HashMap<>();
        body.put("errorCode", errorCode);
        body.put("error", message);
        if (params != null && !params.isEmpty()) {
            body.put("params", params);
        }
        return body;
    }

    @ExceptionHandler(DisabledException.class)
    public ResponseEntity<?> handleDisabled(DisabledException e) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(buildBody(ErrorCode.ACCOUNT_DISABLED.getKey(), "Ce compte est d\u00e9sactiv\u00e9.", null));
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<?> handleBadCredentials(BadCredentialsException e) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(buildBody(ErrorCode.INVALID_CREDENTIALS.getKey(), "Email ou mot de passe incorrect", null));
    }

    @ExceptionHandler(InternalAuthenticationServiceException.class)
    public ResponseEntity<?> handleInternalAuth(InternalAuthenticationServiceException e) {
        Throwable cause = e.getCause() != null ? e.getCause() : e;
        if (cause instanceof DisabledException) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(buildBody(ErrorCode.ACCOUNT_DISABLED.getKey(), "Ce compte est d\u00e9sactiv\u00e9. Veuillez contacter votre administrateur.", null));
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(buildBody(ErrorCode.INVALID_CREDENTIALS.getKey(), "Email ou mot de passe incorrect", null));
    }

    @ExceptionHandler(UsernameNotFoundException.class)
    public ResponseEntity<?> handleUserNotFound(UsernameNotFoundException e) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(buildBody(ErrorCode.USER_NOT_FOUND.getKey(), e.getMessage(), null));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<?> handleValidation(MethodArgumentNotValidException e) {
        Map<String, String> errors = new HashMap<>();
        e.getBindingResult().getFieldErrors()
                .forEach(err -> errors.put(err.getField(), err.getDefaultMessage()));
        return ResponseEntity.badRequest().body(errors);
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<?> handleNotFound(ResourceNotFoundException e) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(buildBody(e.getErrorCode().getKey(), e.getMessage(), e.getParams()));
    }

    @ExceptionHandler(DuplicateResourceException.class)
    public ResponseEntity<?> handleDuplicate(DuplicateResourceException e) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(buildBody(e.getErrorCode().getKey(), e.getMessage(), e.getParams()));
    }

    @ExceptionHandler(AccountLockedException.class)
    public ResponseEntity<?> handleAccountLocked(AccountLockedException e) {
        return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                .body(buildBody(ErrorCode.ACCOUNT_LOCKED.getKey(), e.getMessage(), null));
    }

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<Map<String, Object>> handleBusinessException(BusinessException ex) {
        Map<String, Object> body = buildBody(ex.getErrorCode().getKey(), ex.getMessage(), ex.getParams());
        body.put("status", HttpStatus.BAD_REQUEST.value());
        return new ResponseEntity<>(body, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handleGeneral(Exception e) {
        e.printStackTrace();
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(buildBody(ErrorCode.INTERNAL_ERROR.getKey(), "Une erreur inattendue s'est produite.", null));
    }
}
