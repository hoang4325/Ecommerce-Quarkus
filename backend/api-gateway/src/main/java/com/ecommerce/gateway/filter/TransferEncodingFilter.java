package com.ecommerce.gateway.filter;

import jakarta.ws.rs.container.ContainerRequestContext;
import jakarta.ws.rs.container.ContainerResponseContext;
import jakarta.ws.rs.container.ContainerResponseFilter;
import jakarta.ws.rs.core.HttpHeaders;
import jakarta.ws.rs.ext.Provider;
import java.io.IOException;

/**
 * Global response filter to strip the duplicate 'Transfer-Encoding' header
 * received from downstream microservices before Nginx sees it.
 */
@Provider
public class TransferEncodingFilter implements ContainerResponseFilter {
    @Override
    public void filter(ContainerRequestContext requestContext, ContainerResponseContext responseContext) throws IOException {
        if (responseContext.getHeaders() != null) {
            responseContext.getHeaders().remove("Transfer-Encoding");
            responseContext.getHeaders().remove("transfer-encoding");
        }
    }
}
