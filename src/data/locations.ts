import { Country, State, City } from 'country-state-city';

// We can remove our manual data and use the library instead
export const getAllCountries = () => {
  return Country.getAllCountries().map(country => ({
    code: country.isoCode,
    name: country.name,
    flag: country.flag,
    phonecode: country.phonecode
  }));
};

export const getStatesByCountry = (countryCode: string) => {
  return State.getStatesOfCountry(countryCode).map(state => ({
    code: state.isoCode,
    name: state.name
  }));
};

export const getCitiesByState = (countryCode: string, stateCode: string) => {
  return City.getCitiesOfState(countryCode, stateCode).map(city => ({
    name: city.name
  }));
}; 