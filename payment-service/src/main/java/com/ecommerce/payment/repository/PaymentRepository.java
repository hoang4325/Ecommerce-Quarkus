package com.ecommerce.payment.repository;

import com.ecommerce.payment.entity.Payment;
import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import jakarta.enterprise.context.ApplicationScoped;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@ApplicationScoped
public class PaymentRepository implements PanacheRepositoryBase<Payment, UUID> {
    public Optional<Payment> findByOrderId(UUID orderId) {
        return find("orderId", orderId).firstResultOptional();
    }
    public List<Payment> findByUserId(UUID userId) {
        return find("userId", userId).list();
    }
}
