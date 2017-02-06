# Mocha Chai Sinon Proxyquire Example

## Functional Requirements

Imagine we need to implement a module "twitsta"

#### The user story:
 > As a user of the module 'twitstat'
 >
 > I want to know how popular a certain url is, based on how many times 
 > it was shared on twitter
 >
 >So I can make use of this 'popularity' value in my own application

#### The Logic to assign the 'popularity' value:

 >* LOW POPULARITY: URL is shared fewer than 10 times
 >* MEDIUM POPULARITY: URL is shared between 10 and 50 times
 >* HIGH POPULARITY: URL is shared more than 50 times
 
## Technical Requirements

### twitstat module

How the function signature should look:

```
function getPopularity(url, callback) {

}
```

The callback function should follow the normal node convention
```
function callback(err, data) {

}
```

How the data should look: 
```
{
  "url": "http://imdb.com/",
  "popularity": "HIGH"
}
```
#### The rest of the features
**HIGH Popularity**
 > Given a URL with 51 shares on Twitter
 > 
 > When the popularity of that url is requested 
 > 
 > I should get HIGH as the popularity
 
 **MEDIUM Popularity**
 > Given a URL with 25 shares on Twitter
 > 
 > When the popularity of that url is requested 
 > 
 > I should get MEDIUM as the popularity
 
 **Error handling**
 > Given a random URL
 > 
 > When an error occurred while requesting Twitter
 > 
 > I should get a populated error object and no data
