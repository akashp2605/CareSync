package com.hospital.dto;

import lombok.Data;

@Data
public class DoctorLoginRequest {
    private String doctorName;
    private String phone;
}
