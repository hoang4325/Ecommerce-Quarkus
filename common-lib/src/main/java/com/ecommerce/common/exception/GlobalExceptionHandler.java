package com.ecommerce.common.exception;

import com.ecommerce.common.dto.ApiResponse;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import jakarta.ws.rs.WebApplicationException;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.ExceptionMapper;
import jakarta.ws.rs.ext.Provider;
import org.jboss.logging.Logger;

import java.util.stream.Collectors;

/**
 * Global exception handler — maps all known exceptions to consistent ApiResponse format.
 * Register this in each service by including common-lib on the classpath;
 * Quarkus auto-discovers @Provider via CDI.
 */
@Provider
public class GlobalExceptionHandler implements ExceptionMapper<Throwable> {

    private static final Logger LOG = Logger.getLogger(GlobalExceptionHandler.class);

    @Override
    public Response toResponse(Throwable exception) {

        if (exception instanceof ResourceNotFoundException ex) {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity(ApiResponse.error(ex.getMessage()))
                    .build();
        }

        if (exception instanceof BusinessException ex) {
            return Response.status(ex.getStatusCode())
                    .entity(ApiResponse.error(ex.getMessage()))
                    .build();
        }

        if (exception instanceof ConstraintViolationException ex) {
            String message = ex.getConstraintViolations().stream()
                    .map(ConstraintViolation::getMessage)
                    .collect(Collectors.joining(", "));
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(ApiResponse.error("Validation failed: " + message))
                    .build();
        }

        if (exception instanceof WebApplicationException ex) {
            return Response.status(ex.getResponse().getStatus())
                    .entity(ApiResponse.error(ex.getMessage()))
                    .build();
        }

        LOG.errorf(exception, "Unhandled exception: %s", exception.getMessage());
        return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity(ApiResponse.error("An unexpected error occurred"))
                .build();
    }
}
