package com.example.projet.service;

import com.example.projet.entity.PortfolioItem;
import com.example.projet.entity.User;
import com.example.projet.enums.Role;
import com.example.projet.exception.ResourceNotFoundException;
import com.example.projet.exception.UnauthorizedException;
import com.example.projet.repository.PortfolioItemRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class PortfolioService {

    private final PortfolioItemRepository portfolioItemRepository;

    public PortfolioService(PortfolioItemRepository portfolioItemRepository) {
        this.portfolioItemRepository = portfolioItemRepository;
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() ||
            authentication.getPrincipal().equals("anonymousUser"))
            throw new UnauthorizedException("User not authenticated");
        return (User) authentication.getPrincipal();
    }

    private void requireContractor(User user) {
        if (user.getRole() != Role.CONTRACTOR)
            throw new UnauthorizedException("Only contractors can manage portfolio items");
    }

    public PortfolioItem createItem(PortfolioItem details) {
        User currentUser = getCurrentUser();
        requireContractor(currentUser);

        if (details.getTitle() == null || details.getTitle().isBlank())
            throw new IllegalArgumentException("Title is required");
        if (details.getServiceType() == null || details.getServiceType().isBlank())
            throw new IllegalArgumentException("Service type is required");

        details.setContractor(currentUser);
        return portfolioItemRepository.save(details);
    }

    public List<PortfolioItem> getMyProjects() {
        User currentUser = getCurrentUser();
        requireContractor(currentUser);
        return portfolioItemRepository.findByContractorId(currentUser.getId());
    }

    public PortfolioItem updateItem(Long id, PortfolioItem details) {
        User currentUser = getCurrentUser();
        requireContractor(currentUser);

        PortfolioItem item = portfolioItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Portfolio item not found with id: " + id));

        if (!item.getContractor().getId().equals(currentUser.getId()))
            throw new UnauthorizedException("You can only update your own portfolio items");

        if (details.getTitle() != null)
            item.setTitle(details.getTitle());
        if (details.getServiceType() != null)
            item.setServiceType(details.getServiceType());
        if (details.getDescription() != null)
            item.setDescription(details.getDescription());
        if (details.getProblemDescription() != null)
            item.setProblemDescription(details.getProblemDescription());
        if (details.getSolutionDescription() != null)
            item.setSolutionDescription(details.getSolutionDescription());
        if (details.getBeforePhotoUrl() != null)
            item.setBeforePhotoUrl(details.getBeforePhotoUrl());
        if (details.getAfterPhotoUrl() != null)
            item.setAfterPhotoUrl(details.getAfterPhotoUrl());
        if (details.getWipPhotoUrl() != null)
            item.setWipPhotoUrl(details.getWipPhotoUrl());
        if (details.getLocation() != null)
            item.setLocation(details.getLocation());
        if (details.getCompletionDate() != null)
            item.setCompletionDate(details.getCompletionDate());

        return portfolioItemRepository.save(item);
    }

    public void deleteItem(Long id) {
        User currentUser = getCurrentUser();
        requireContractor(currentUser);

        PortfolioItem item = portfolioItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Portfolio item not found with id: " + id));

        if (!item.getContractor().getId().equals(currentUser.getId()))
            throw new UnauthorizedException("You can only delete your own portfolio items");

        portfolioItemRepository.delete(item);
    }
}