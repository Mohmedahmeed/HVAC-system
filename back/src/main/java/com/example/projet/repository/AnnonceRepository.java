package com.example.projet.repository;
import com.example.projet.entity.Annonce;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
@Repository
public interface AnnonceRepository extends JpaRepository<Annonce, Long> {
    List<Annonce> findByCategorieAndLieu(String categorie, String lieu);
}
