package com.ecommerce.notification.repository;

import com.ecommerce.notification.entity.Notification;
import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import io.quarkus.panache.common.Sort;
import jakarta.enterprise.context.ApplicationScoped;
import java.util.List;
import java.util.UUID;

@ApplicationScoped
public class NotificationRepository implements PanacheRepositoryBase<Notification, UUID> {
    public List<Notification> findByUserId(UUID userId) {
        return find("userId", Sort.by("createdAt").descending(), userId).list();
    }
    public List<Notification> findUnreadByUserId(UUID userId) {
        return find("userId = ?1 and read = false", Sort.by("createdAt").descending(), userId).list();
    }
}
