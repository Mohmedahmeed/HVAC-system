package com.example.projet.service;

import com.example.projet.entity.PortfolioItem;
import com.example.projet.entity.User;
import com.example.projet.enums.Role;
import com.example.projet.exception.ResourceNotFoundException;
import com.example.projet.exception.UnauthorizedException;
import com.example.projet.repository.PortfolioItemRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PortfolioServiceTest {

    @Mock
    private PortfolioItemRepository portfolioItemRepository;

    private PortfolioService portfolioService;

    @BeforeEach
    void setUp() {
        portfolioService = new PortfolioService(portfolioItemRepository);
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    private void authenticate(User user) {
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(user, null, user.getAuthorities()));
    }

    private User contractor(Long id) {
        User user = new User();
        user.setId(id);
        user.setRole(Role.CONTRACTOR);
        return user;
    }

    private User customer(Long id) {
        User user = new User();
        user.setId(id);
        user.setRole(Role.CUSTOMER);
        return user;
    }

    private PortfolioItem item(Long id, User owner, String title) {
        PortfolioItem item = new PortfolioItem();
        item.setId(id);
        item.setContractor(owner);
        item.setTitle(title);
        return item;
    }

    @Test
    void createItem_setsOwnerAndSaves() {
        User current = contractor(5L);
        authenticate(current);
        PortfolioItem details = new PortfolioItem();
        details.setTitle("HVAC Install");
        details.setServiceType("AC Installation");
        when(portfolioItemRepository.save(details)).thenReturn(details);

        PortfolioItem saved = portfolioService.createItem(details);

        assertEquals(5L, saved.getContractor().getId());
        assertEquals(current, saved.getContractor());
        verify(portfolioItemRepository).save(details);
    }

    @Test
    void createItem_whenNotContractor_throwsUnauthorized() {
        authenticate(customer(2L));
        PortfolioItem details = new PortfolioItem();
        details.setTitle("HVAC Install");

        assertThrows(UnauthorizedException.class, () -> portfolioService.createItem(details));
    }

    @Test
    void getMyProjects_returnsOnlyOwnItems() {
        User current = contractor(5L);
        authenticate(current);
        when(portfolioItemRepository.findByContractorId(5L))
                .thenReturn(List.of(item(1L, current, "Project A")));

        List<PortfolioItem> result = portfolioService.getMyProjects();

        assertEquals(1, result.size());
        assertEquals("Project A", result.get(0).getTitle());
        verify(portfolioItemRepository).findByContractorId(5L);
    }

    @Test
    void getMyProjects_whenNotContractor_throwsUnauthorized() {
        authenticate(customer(2L));

        assertThrows(UnauthorizedException.class, () -> portfolioService.getMyProjects());
    }

    @Test
    void updateItem_whenNotOwner_throwsUnauthorized() {
        User current = contractor(6L);
        authenticate(current);
        PortfolioItem ownedByOther = item(1L, contractor(5L), "Other's project");
        when(portfolioItemRepository.findById(1L)).thenReturn(Optional.of(ownedByOther));

        PortfolioItem update = new PortfolioItem();
        update.setTitle("Hacked title");

        assertThrows(UnauthorizedException.class, () -> portfolioService.updateItem(1L, update));
    }

    @Test
    void updateItem_whenNotFound_throwsResourceNotFound() {
        User current = contractor(5L);
        authenticate(current);
        when(portfolioItemRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> portfolioService.updateItem(999L, new PortfolioItem()));
    }

    @Test
    void updateItem_own_success() {
        User current = contractor(5L);
        authenticate(current);
        PortfolioItem existing = item(1L, current, "Old title");
        when(portfolioItemRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(portfolioItemRepository.save(existing)).thenReturn(existing);

        PortfolioItem update = new PortfolioItem();
        update.setTitle("New title");
        update.setServiceType("AC Repair");

        PortfolioItem result = portfolioService.updateItem(1L, update);

        assertEquals("New title", result.getTitle());
        assertEquals("AC Repair", result.getServiceType());
        verify(portfolioItemRepository).save(existing);
    }

    @Test
    void deleteItem_whenNotOwner_throwsUnauthorized() {
        User current = contractor(6L);
        authenticate(current);
        PortfolioItem ownedByOther = item(1L, contractor(5L), "Other's project");
        when(portfolioItemRepository.findById(1L)).thenReturn(Optional.of(ownedByOther));

        assertThrows(UnauthorizedException.class, () -> portfolioService.deleteItem(1L));
    }

    @Test
    void deleteItem_own_success() {
        User current = contractor(5L);
        authenticate(current);
        PortfolioItem own = item(1L, current, "My project");
        when(portfolioItemRepository.findById(1L)).thenReturn(Optional.of(own));

        portfolioService.deleteItem(1L);

        verify(portfolioItemRepository).delete(own);
    }
}