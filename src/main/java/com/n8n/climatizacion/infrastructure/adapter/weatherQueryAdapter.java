package com.n8n.climatizacion.infrastructure.adapter;

import com.n8n.climatizacion.application.mapper.weatherQueryMapper;
import com.n8n.climatizacion.domain.model.weatherQuery;
import com.n8n.climatizacion.domain.util.weatherQueryPort;
import com.n8n.climatizacion.infrastructure.entity.weatherQueryEntity;
import com.n8n.climatizacion.infrastructure.repository.weatherQueryRepository;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Component;

@Component
public class weatherQueryAdapter implements weatherQueryPort {

  private final weatherQueryRepository repository;

  public weatherQueryAdapter(weatherQueryRepository repository) {
    this.repository = repository;
  }

  @Override
  public weatherQuery create(weatherQuery query) {
    weatherQueryEntity entity = repository.save(weatherQueryMapper.toEntity(query));
    return weatherQueryMapper.toDomain(entity);
  }

  @Override
  public weatherQuery readById(Long id) {
    Optional<weatherQueryEntity> entity = repository.findById(id);
    return entity.map(weatherQueryMapper::toDomain).orElse(null);
  }

  @Override
  public Iterable<weatherQuery> listAll() {
    return weatherQueryMapper.toDomainList(repository.findAll());
  }

  @Override
  public Iterable<weatherQuery> findByCity(String city) {
    if (city == null || city.isBlank()) {
      return Collections.emptyList();
    }
    return weatherQueryMapper.toDomainList(
        repository.findTop10ByCityStartingWithIgnoreCase(city));
  }

  @Override
  public Iterable<weatherQuery> findByCountry(String country) {
    if (country == null || country.isBlank()) {
      return Collections.emptyList();
    }
    return weatherQueryMapper.toDomainList(
        repository.findTop10ByCountryStartingWithIgnoreCase(country));
  }

  @Override
  public Iterable<weatherQuery> searchByCityOrCountry(String query) {
    if (query == null || query.isBlank()) {
      return Collections.emptyList();
    }
    List<weatherQueryEntity> entities = repository
        .findTop10ByCityStartingWithIgnoreCaseOrCountryStartingWithIgnoreCase(query, query);
    return weatherQueryMapper.toDomainList(entities);
  }

  @Override
  public Iterable<weatherQuery> listRecent(int limit) {
    int safeLimit = limit <= 0 ? 10 : limit;
    List<weatherQueryEntity> entities = repository
        .findAllByOrderByIdDesc(PageRequest.of(0, safeLimit));
    return weatherQueryMapper.toDomainList(entities);
  }
}
