package com.example.projet.controller;

import com.example.projet.entity.PortfolioItem;
import com.example.projet.service.PortfolioService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/contractor-portfolio")
public class ContractorPortfolioController {

    private final PortfolioService portfolioService;

    public ContractorPortfolioController(PortfolioService portfolioService) {
        this.portfolioService = portfolioService;
    }

    @GetMapping("/my-projects")
    @PreAuthorize("hasRole('CONTRACTOR')")
    public ResponseEntity<List<PortfolioItem>> getMyProjects() {
        return ResponseEntity.ok(portfolioService.getMyProjects());
    }

    @PostMapping
    @PreAuthorize("hasRole('CONTRACTOR')")
    public ResponseEntity<PortfolioItem> createItem(@RequestBody PortfolioItem item) {
        return new ResponseEntity<>(portfolioService.createItem(item), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('CONTRACTOR')")
    public ResponseEntity<PortfolioItem> updateItem(@PathVariable Long id, @RequestBody PortfolioItem item) {
        return ResponseEntity.ok(portfolioService.updateItem(id, item));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('CONTRACTOR')")
    public ResponseEntity<Void> deleteItem(@PathVariable Long id) {
        portfolioService.deleteItem(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}