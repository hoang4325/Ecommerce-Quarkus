package com.ecommerce.common.exception;

/**
 * Thrown for business rule violations (400 Bad Request / 422 Unprocessable Entity).
 */
public class BusinessException extends RuntimeException {

    private final int statusCode;

    public BusinessException(String message) {
        super(message);
        this.statusCode = 400;
    }

    public BusinessException(String message, int statusCode) {
        super(message);
        this.statusCode = statusCode;
    }

    public int getStatusCode() {
        return statusCode;
    }
}
