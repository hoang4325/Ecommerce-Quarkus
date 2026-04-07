package com.ecommerce.user.dto;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateProfileRequest {
    private String firstName;
    private String lastName;
    @Size(max = 20) private String phone;
    private String address;
    @Size(max = 100) private String city;
    @Size(max = 100) private String country;
}
