package com.hospital.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Entity
@Data
public class Doctor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long doctorId;

    private String doctorName;

    private String specialization;

    private String phone;

    private String email;

    private String qualification;

    private Integer experience;

    private String address;

    @ManyToOne
    @JoinColumn(name = "deptId")
    private Department dept;

    @OneToMany(mappedBy = "doctor", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<Appointment> appointments = new ArrayList<>();

    @ManyToMany
    @JoinTable(name = "doctor_speciality",
            joinColumns = @JoinColumn(name = "doctor_id"),
            inverseJoinColumns = @JoinColumn(name = "speciality_id")
    )
    private List<Speciality> speciality = new ArrayList<>();
}