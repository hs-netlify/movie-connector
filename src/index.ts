import { NetlifyIntegration } from "@netlify/sdk";
import MovieAPI from "./api/movies/movieDbHelper";

const integration = new NetlifyIntegration();

const connector = integration.createConnector({
  typePrefix: `MovieDatabase`,
});

connector.model(async ({ define }) => {
  define.nodeModel({
    name: `Movie`,
    description: `A general Movie Object`,
    fields: {
      title: {
        type: `String`,
      },
      originalLanguage: {
        type: `String`,
        required: true,
      },
      overview: {
        type: `String`,
        required: true,
      },
      popularity: {
        type: `Float`,
        required: true,
      },
      posterPath: {
        type: `String`,
        required: true,
      },
      backdropPath: {
        type: `String`,
        required: true,
      },
    },
  });
});

const sourceMovies = async () => {
  const top20Movies = await MovieAPI.fetchMovies("", 1);
  return top20Movies;
};

connector.event(`createAllNodes`, async ({ models }) => {
  const movies = await sourceMovies();
  movies.results.forEach((movie) => {
    models.Movie.create({
      id: movie.id,
      title: movie.title,
      originalLanguage: movie.original_language,
      overview: movie.overview,
      popularity: movie.popularity,
      posterPath: movie.poster_path,
      backdropPath: movie.backdrop_path,
    });
  });
});

connector.event(`updateNodes`, async ({ models }) => {
  const movies = await sourceMovies();
  movies.results.forEach((movie) => {
    models.Movie.create({
      id: movie.id,
      title: movie.title,
      originalLanguage: movie.original_language,
      overview: movie.overview,
      popularity: movie.popularity,
      posterPath: movie.poster_path,
      backdropPath: movie.backdrop_path,
    });
  });
});

connector.pluginOptionsSchema(({ Joi }) => {
  return Joi.object({
    // this is a plugin option that will be available to the other API's above.
    examplePluginOption: Joi.string(), // see Joi documentation for more options.
  });
});

// the integration must be exported as a named export for the SDK to use it.
export { integration };
