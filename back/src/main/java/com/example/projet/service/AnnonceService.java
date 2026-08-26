package com.example.projet.service;

import com.example.projet.entity.Annonce;

import java.util.List;
public interface AnnonceService {

    Annonce createAnnonce(Annonce annonce);

    List<Annonce> getAllAnnonces();

    List<Annonce> Recherche(String categorie, String lieu);

    Annonce updateAnnonce(Long id,Annonce annonce);

    void deleteAnnonce(Long annonceId);
}
