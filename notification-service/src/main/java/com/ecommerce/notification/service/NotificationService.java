package com.ecommerce.notification.service;

import com.ecommerce.notification.entity.Notification;
import com.ecommerce.notification.repository.NotificationRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import org.jboss.logging.Logger;

import java.util.List;
import java.util.UUID;

@ApplicationScoped
public class NotificationService {

    private static final Logger LOG = Logger.getLogger(NotificationService.class);

    @Inject NotificationRepository notificationRepository;

    @Transactional
    public void createNotification(UUID userId, String type, String message) {
        Notification n = new Notification();
        n.setUserId(userId);
        n.setType(type);
        n.setMessage(message);
        n.setRead(false);
        notificationRepository.persist(n);
        LOG.infof("[NOTIFY] user=%s type=%s message=%s", userId, type, message);
    }

    public List<Notification> getUserNotifications(UUID userId) {
        return notificationRepository.findByUserId(userId);
    }

    public List<Notification> getUnread(UUID userId) {
        return notificationRepository.findUnreadByUserId(userId);
    }

    @Transactional
    public void markAsRead(UUID notificationId) {
        notificationRepository.findByIdOptional(notificationId).ifPresent(n -> n.setRead(true));
    }
}
