package com.n8n.climatizacion.infrastructure.repository;

import com.n8n.climatizacion.infrastructure.entity.weatherQueryEntity;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface weatherQueryRepository extends JpaRepository<weatherQueryEntity, Long> {

  List<weatherQueryEntity> findTop10ByCityStartingWithIgnoreCase(String cityPrefix);

  List<weatherQueryEntity> findTop10ByCountryStartingWithIgnoreCase(String countryPrefix);

  List<weatherQueryEntity> findTop10ByCityStartingWithIgnoreCaseOrCountryStartingWithIgnoreCase(
      String cityPrefix, String countryPrefix);

  List<weatherQueryEntity> findAllByOrderByIdDesc(Pageable pageable);
}
