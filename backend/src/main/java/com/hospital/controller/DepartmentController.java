package com.hospital.controller;

import com.hospital.entity.Department;
import com.hospital.service.DepartmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/department")
public class DepartmentController {

    @Autowired
    private DepartmentService service;

    @PostMapping("/add")
    public Department add(@RequestBody Department d){
        return service.add(d);
    }

    @GetMapping("/getall")
    public List<Department> getAll(){
        return service.getAll();
    }

    @GetMapping("/get/{id}")
    public Department getById(@PathVariable Long id){
        return service.getById(id);
    }

    @PostMapping("/update/{id}")
    public Department update(@PathVariable Long id, @RequestBody Department d){
        return service.update(id,d);
    }

    @DeleteMapping("/delete/{id}")
    public String deleteById(@PathVariable Long id){
        return service.deleteById(id);
    }
}