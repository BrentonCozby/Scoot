export default function to(promise) {
   return promise
   .then(data => [null, data])
   .catch(err => {
     console.log(err)
     return [err]
   })
}
