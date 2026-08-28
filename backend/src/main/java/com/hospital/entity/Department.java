package com.hospital.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Entity
@Data
public class Department {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long deptId;

    private String deptName;
    private String deptLocation;

    @OneToMany(mappedBy = "dept", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<Doctor> doctors = new ArrayList<>();
}