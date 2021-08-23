pragma solidity ^0.5.0;

contract Decentragram {
    string  public name = "Decentragram";  

    //  Store Images
    uint public imageCount=0;
    mapping(uint => Image) public images;

    struct Image{
      uint id;
      string hash;
      string description;
      uint tipAmount;
      address payable author;
    }
    event ImageCreated(
      uint id,
      string hash,
      string description,
      uint tipAmount,
      address payable author
    );
    event ImageTipped(
      uint id,
      string hash,
      string description,
      uint tipAmount,
      address payable author
    );

    // Create Images
    function uploadImage(string memory _imgHash,string memory _description) public {
      //  Make Sure Image Hash Exist
      require(bytes(_imgHash).length > 0);
      //  Make Sure Description Exist
      require(bytes(_description).length > 0);
      //  Make Sure Uploader Address Exists
      require(msg.sender != address(0));

      // Increment Image Id
      imageCount++;
      // Add Image to contract
      images[imageCount] = Image(imageCount,_imgHash,_description,0,msg.sender);

      //  Trigger Image
      emit ImageCreated(imageCount,_imgHash,_description,0,msg.sender);
      
    }


    // Tip Images
    function tipImageOwner(uint _id) public payable{   // we use payable because we send the currency
    // Make sure That Id Is valid
    require(_id > 0 && _id <= imageCount);
  
    // Fetch Image
    Image memory _image = images[_id];
    //  Fetch The Author
    address payable _author = _image.author;
    // pay the ether sending from the Ether
    address(_author).transfer(msg.value);

    //  Increment The Tip amount
    _image.tipAmount += msg.value;
    // Update The Image
    images[_id] = _image;


    //  Trigger an Event
    emit ImageTipped(_id, _image.hash, _image.description, _image.tipAmount, _author);
    }
}