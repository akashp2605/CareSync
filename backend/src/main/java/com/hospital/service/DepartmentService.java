package com.hospital.service;

import com.hospital.entity.Department;
import com.hospital.repository.DepartmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DepartmentService {

    @Autowired
    private DepartmentRepository departmentRepository;

    public Department add(Department d) {
        return departmentRepository.save(d);
    }

    public List<Department> getAll() {
        return departmentRepository.findAll();
    }

    public Department getById(Long id) {
        return departmentRepository.findById(id)
                .orElseThrow(()-> new RuntimeException("Department Not Found"));
    }

    public Department update(Long id, Department d) {
        Department dd=getById(id);
        dd.setDeptName(d.getDeptName());
        dd.setDeptLocation(d.getDeptLocation());
        return departmentRepository.save(dd);
    }

    public String deleteById(Long id) {
        Department d=getById(id);
        departmentRepository.deleteById(id);
        return "Department deleted Successfully";
    }
}