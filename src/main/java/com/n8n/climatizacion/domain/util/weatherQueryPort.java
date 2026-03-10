package com.n8n.climatizacion.domain.util;

import com.n8n.climatizacion.domain.model.weatherQuery;

/**
 * Puerto del dominio para operaciones basicas sobre consultas climáticas.
 */
public interface weatherQueryPort {

  weatherQuery create(weatherQuery query);

  weatherQuery readById(Long id);

  Iterable<weatherQuery> listAll();

  Iterable<weatherQuery> findByCity(String city);

  Iterable<weatherQuery> findByCountry(String country);

  Iterable<weatherQuery> searchByCityOrCountry(String query);

  Iterable<weatherQuery> listRecent(int limit);

}
