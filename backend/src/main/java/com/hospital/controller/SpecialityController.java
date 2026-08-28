package com.hospital.controller;

import com.hospital.entity.Speciality;
import com.hospital.service.SpecialityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/speciality")
public class SpecialityController {

    @Autowired
    private SpecialityService service;

    @PostMapping("/add")
    public Speciality add(@RequestBody Speciality s){
        return service.add(s);
    }

    @GetMapping("/getall")
    public List<Speciality> getAll(){
        return service.getAll();
    }

    @GetMapping("/get/{id}")
    public Speciality getById(@PathVariable Long id){
        return service.getById(id);
    }

    @PostMapping("/update/{id}")
    public Speciality update(@PathVariable Long id, @RequestBody Speciality s){
        return service.update(id,s);
    }

    @DeleteMapping("/delete/{id}")
    public String deleteById(@PathVariable Long id){
        return service.deleteById(id);
    }
}
