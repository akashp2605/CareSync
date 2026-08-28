package com.hospital.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponse {
    private String role;
    private String username;
    private Long doctorId;
    private String doctorName;
    private Long patientId;
    private String patientName;
    private String message;
    
    public static LoginResponse adminSuccess(String username) {
        return new LoginResponse("ADMIN", username, null, null, null, null, "Admin login successful");
    }
    
    public static LoginResponse doctorSuccess(Long doctorId, String doctorName) {
        return new LoginResponse("DOCTOR", null, doctorId, doctorName, null, null, "Doctor login successful");
    }
    
    public static LoginResponse patientSuccess(Long patientId, String patientName) {
        return new LoginResponse("PATIENT", null, null, null, patientId, patientName, "Patient login successful");
    }
    
    public static LoginResponse failure(String message) {
        return new LoginResponse(null, null, null, null, null, null, message);
    }
}
