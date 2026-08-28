package com.hospital.dto;

import lombok.Data;

@Data
public class PatientLoginRequest {
    private String patientName;
    private String phone;
}
