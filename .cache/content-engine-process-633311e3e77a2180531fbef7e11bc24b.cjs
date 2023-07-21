
          const engineOptions = {"directory":"/Users/hs/code/netlify-sdk","engineConfig":{"plugins":["/Users/hs/code/netlify-sdk/.ntli/package.json"]}}
          const { contentEngine } = require("/Users/hs/code/netlify-sdk/node_modules/content-engine/dist/services/content-engine.js")
          const { saveState } = require("/Users/hs/code/netlify-sdk/node_modules/content-engine/dist/redux/index.js")

          const engine = contentEngine(engineOptions)

          if (!process.send) {
            throw new Error(
              'Started Content Engine as a subprocess, but no parent was found.'
            )
          }

          process.send({
            type: 'CONTENT_ENGINE_CHILD_RUNNING',
          })

          process.on('message', async message => {
            if (message.type === 'COMMAND' && message.action?.type === 'EXIT') {
              saveState()
              const code = typeof message.action?.payload === 'number'
                ? message.action.payload
                : 0

              process.exit(code)
            } else if (message.type === 'CONTENT_ENGINE_CHILD_SYNC_DATA') {
              engine.sync(message.payload).then(() => {
                process.send({
                  type: 'CONTENT_ENGINE_CHILD_FINISHED_SYNCING_DATA',
                })
              }).catch(e => {
                process.send({
                  type: 'CONTENT_ENGINE_CHILD_FINISHED_SYNCING_DATA',
                  error: {
                    message: e.message,
                    stack: e.stack
                  }
                })
              })
            } else if (message.type === 'CONTENT_ENGINE_CHILD_QUERY') {
              engine.test.query(message.payload.query, message.payload.variables).then(result => {
                process.send({
                  type: 'CONTENT_ENGINE_CHILD_QUERY_RESULT--' + message.payload.queryId,
                  payload: {
                    result
                  }
                })
              }).catch(e => {
                console.error(e)
                process.send({
                  type: 'CONTENT_ENGINE_CHILD_QUERY_RESULT--' + message.payload.queryId,
                  payload: {
                    error: e.message,
                    stack: e.stack
                  }
                })
              })
            } else if (message.type === 'CONTENT_ENGINE_CHILD_INITIALIZE') {
              engine.initialize(message.payload).then(() => {
                process.send({
                  type: 'CONTENT_ENGINE_CHILD_FINISHED_INITIALIZING',
                })
              }).catch(e => {
                process.send({
                  type: 'CONTENT_ENGINE_CHILD_FINISHED_INITIALIZING',
                  error: {
                    message: e.message,
                    stack: e.stack
                  }
                })
              })
            } else if (message.type === 'CONTENT_ENGINE_CHILD_INVOKE_TEST_UTIL') {
              const responseType = 'CONTENT_ENGINE_CHILD_INVOKE_TEST_UTIL_RESULT--' + message.payload.messageId

              function sendError(e) {
                console.error(e)
                process.send({
                  type: 'CONTENT_ENGINE_CHILD_INVOKE_TEST_UTIL_RESULT--' + message.payload.messageId,
                  payload: {
                    error: e.message,
                    stack: e.stack
                  }
                })
              }

              try {
                const promiseOrResult = engine.test[message.payload.utilName](...message.payload.args)

                if (promiseOrResult && 'then' in promiseOrResult) {
                  promiseOrResult.then(result => {
                    process.send({
                      type: responseType,
                      payload: {
                        result
                      }
                    })
                  }).catch(sendError)
                } else {
                  process.send({
                    type: responseType,
                    payload: {
                      result: promiseOrResult
                    }
                  })
                }
              } catch (e) {
                sendError(e)
              }
            }
          })
      