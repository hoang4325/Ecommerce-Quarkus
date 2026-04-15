package com.ecommerce.user.service;

import com.ecommerce.common.exception.ResourceNotFoundException;
import com.ecommerce.user.dto.UpdateProfileRequest;
import com.ecommerce.user.dto.UserProfileDTO;
import com.ecommerce.user.entity.UserProfile;
import com.ecommerce.user.repository.UserProfileRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import org.jboss.logging.Logger;

import java.util.UUID;

@ApplicationScoped
public class UserProfileService {

    private static final Logger LOG = Logger.getLogger(UserProfileService.class);

    @Inject UserProfileRepository userProfileRepository;

    public UserProfileDTO getProfile(UUID userId) {
        UserProfile profile = userProfileRepository.findByIdOptional(userId)
                .orElseThrow(() -> new ResourceNotFoundException("UserProfile", "id", userId));
        return toDTO(profile);
    }

    /**
     * Create or get profile. Called when user first accesses their profile.
     * Auto-creates from OIDC token claims if not existing.
     */
    @Transactional
    public UserProfileDTO getOrCreateProfile(UUID userId, String email, String firstName, String lastName) {
        return userProfileRepository.findByIdOptional(userId)
                .map(this::toDTO)
                .orElseGet(() -> {
                    UserProfile profile = new UserProfile();
                    profile.setId(userId);
                    profile.setEmail(email);
                    profile.setFirstName(firstName != null ? firstName : "");
                    profile.setLastName(lastName != null ? lastName : "");
                    userProfileRepository.persist(profile);
                    LOG.infof("Created new profile for user %s (%s)", userId, email);
                    return toDTO(profile);
                });
    }

    @Transactional
    public UserProfileDTO updateProfile(UUID userId, UpdateProfileRequest request) {
        UserProfile profile = userProfileRepository.findByIdOptional(userId)
                .orElseThrow(() -> new ResourceNotFoundException("UserProfile", "id", userId));

        if (request.getFirstName() != null) profile.setFirstName(request.getFirstName());
        if (request.getLastName() != null)  profile.setLastName(request.getLastName());
        if (request.getPhone() != null)     profile.setPhone(request.getPhone());
        if (request.getAddress() != null)   profile.setAddress(request.getAddress());
        if (request.getCity() != null)      profile.setCity(request.getCity());
        if (request.getCountry() != null)   profile.setCountry(request.getCountry());

        LOG.infof("Updated profile for user %s", userId);
        return toDTO(profile);
    }

    private UserProfileDTO toDTO(UserProfile p) {
        return UserProfileDTO.builder()
                .id(p.getId())
                .firstName(p.getFirstName())
                .lastName(p.getLastName())
                .email(p.getEmail())
                .phone(p.getPhone())
                .address(p.getAddress())
                .city(p.getCity())
                .country(p.getCountry())
                .build();
    }
}
