package com.hospital.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Entity
@Data
public class Speciality {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long specialityId;

    private String name;

    @ManyToMany(mappedBy = "speciality")
    @JsonIgnore
    private List<Doctor> doctors = new ArrayList<>();
}