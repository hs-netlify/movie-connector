import { NetlifyIntegration } from "@netlify/sdk";
import MovieAPI from "./api/movies/movieDbHelper";

const integration = new NetlifyIntegration();

const connector = integration.createConnector({
  typePrefix: `Movie`,
});

connector.model(async ({ define }) => {
  define.object({
    name: `Text`,
    fields: {
      contents: { type: `String`, required: true },
    },
  });

  const Content = define.object({
    name: `Content`,
    description: `Content is a list of blocks that have a title field.`,
    fields: {
      title: {
        type: `String`,
        required: true,
      },
      foo: {
        type: define.object({
          name: `Foo`,
          fields: {
            bar: {
              type: `String`,
              required: true,
            },
            author: {
              type: `Author`,
              required: true,
            },
            coAuthors: {
              type: `Author`,
              list: true,
            },
          },
        }),
        required: true,
      },
      blocks: {
        required: false,
        list: true,
        type: define.union({
          name: `Block`,
          types: [
            `Text`,
            define.object({
              name: `Cta`,
              fields: {
                title: {
                  type: `String`,
                  required: true,
                },
                link: { type: `String`, required: true },
              },
            }),
          ],
        }),
      },
    },
  });

  define.nodeModel({
    name: `Post`,
    fields: {
      author: {
        type: `Author`,
        required: true,
      },
      title: {
        type: `String`,
        required: true,
      },
      other: {
        type: `String`,
      },
      content: {
        required: true,
        type: Content,
      },
      description: {
        type: `String`,
      },
      updatedAt: {
        type: `Date`,
      },
      float: {
        type: `Float`,
      },
      mixedContentUnion: {
        type: define.union({
          name: `MixedContentUnion`,
          types: [`Author`, `Post`],
        }),
      },
    },
  });

  define.nodeModel({
    name: `Author`,
    fields: {
      name: {
        type: `String`,
        required: true,
      },
      email: {
        type: `String`,
      },
      posts: {
        type: `Post`,
        list: true,
      },
      updatedAt: {
        type: `String`,
      },
    },
  });
});

const sourceData = async () => {
  const top20Movies = await MovieAPI.fetchMovies("", 1);
  console.log(top20Movies);

  return top20Movies;
};

connector.event(`createAllNodes`, async ({ models }) => {
  models.Post.create([
    {
      id: `1`,
      title: `Hello world!`,
      other: `yo`,
      description: `Hello world!`,
      author: `1`,
      float: 1.2,
      updatedAt: `2020-01-01T00:00:00.000Z`,
      mixedContentUnion: {
        __typename: `Post`,
        id: `1`,
      },
      content: {
        title: `Hello world!`,

        foo: {
          bar: `baz`,
          author: `2`,
          coAuthors: [`1`, `2`],
        },

        blocks: [
          {
            __typename: `Text`,
            contents: `Hello world!`,
          },
          {
            __typename: `Cta`,
            title: `Netlifyre`,
            link: `https://netlify.com`,
          },
        ],
      },
    },
    {
      id: `2`,
      title: `Hello world 2!`,
      description: `Second post!`,
      updatedAt: `2020-01-01T00:00:00.000Z`,
      author: `2`,
      content: {
        title: `Hello world 2!`,
        foo: {
          bar: `baz`,
          author: `2`,
        },
      },
    },
    {
      id: `3`,
      author: `2`,
      title: `Hello world 3!`,
      description: `Third post!`,
      updatedAt: `2020-01-01T00:00:00.000Z`,
      content: {
        title: `Hello world 3!`,
        foo: {
          bar: `baz`,
          author: `2`,
        },
      },
    },
  ]);

  models.Author.create([
    {
      id: `1`,
      name: `Jane`,
      updatedAt: `2020-01-01T00:00:00.000Z`,
      posts: [`1`],
    },
    {
      id: `2`,
      name: `Marta`,
      updatedAt: `2020-01-01T00:00:00.000Z`,
      posts: [`2`, `3`],
    },
  ]);
});

connector.event(`updateNodes`, ({ models }) => {
  models.Post.create({
    id: `4`,
    description: `Hello world 5!`,
    updatedAt: `2020-01-01T00:00:00.000Z`,
    author: `1`,
    title: `Hello world 5`,
    content: {
      title: `Hello world!`,
      foo: {
        bar: `baz`,
        author: `1`,
      },
    },
  });

  models.Author.create({
    id: `1`,
    name: `Jane`,
    updatedAt: `2020-01-01T00:00:00.001Z`,
    posts: [`1`, `4`],
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
