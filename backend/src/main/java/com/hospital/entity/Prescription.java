package com.hospital.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class Prescription {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long prescriptionId;

    private String medicine;

    private String Dosage;

    @OneToOne(mappedBy = "prescription")
    @JsonIgnore
    private Appointment appointment;
}