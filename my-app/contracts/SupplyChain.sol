// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SupplyChain {
    struct Product {
        uint256 id;
        string name;
        string description;
        uint256 price;
        address manufacturer;
        address currentOwner;
        uint256 timestamp;
        bool isAvailable;
        bool isVerified;
        address[] verifiers;
    }

    struct TrackingInfo {
        address location;
        string status;
        uint256 timestamp;
        string verificationNote;
        address verifiedBy;
    }

    struct Transaction {
        uint256 productId;
        address from;
        address to;
        uint256 timestamp;
        string note;
    }

    mapping(uint256 => Product) public products;
    mapping(uint256 => TrackingInfo[]) public trackingHistory;
    mapping(uint256 => Transaction[]) public transactions;
    uint256 public productCount;

    event ProductCreated(uint256 indexed id, string name, address manufacturer);
    event ProductTransferred(uint256 indexed id, address from, address to);
    event StatusUpdated(uint256 indexed id, string status);
    event ProductVerified(uint256 indexed id, address verifier);
    event TransactionRecorded(uint256 indexed id, address from, address to);

    function createProduct(
        string memory _name,
        string memory _description,
        uint256 _price
    ) public {
        productCount++;
        products[productCount] = Product(
            productCount,
            _name,
            _description,
            _price,
            msg.sender,
            msg.sender,
            block.timestamp,
            true,
            false,
            new address[](0)
        );

        trackingHistory[productCount].push(
            TrackingInfo(msg.sender, "Created", block.timestamp, "Product created", msg.sender)
        );

        emit ProductCreated(productCount, _name, msg.sender);
    }

    function transferProduct(uint256 _productId, address _newOwner, string memory _note) public {
        require(products[_productId].currentOwner == msg.sender, "Not the current owner");
        require(products[_productId].isAvailable, "Product not available");

        // Record transaction
        transactions[_productId].push(Transaction(
            _productId,
            msg.sender,
            _newOwner,
            block.timestamp,
            _note
        ));

        products[_productId].currentOwner = _newOwner;
        products[_productId].timestamp = block.timestamp;

        trackingHistory[_productId].push(
            TrackingInfo(_newOwner, "Transferred", block.timestamp, _note, msg.sender)
        );

        emit ProductTransferred(_productId, msg.sender, _newOwner);
        emit TransactionRecorded(_productId, msg.sender, _newOwner);
    }

    function verifyProduct(uint256 _productId, string memory _verificationNote) public {
        require(products[_productId].currentOwner == msg.sender, "Not the current owner");
        require(!products[_productId].isVerified, "Product already verified");

        products[_productId].isVerified = true;
        products[_productId].verifiers.push(msg.sender);

        trackingHistory[_productId].push(
            TrackingInfo(msg.sender, "Verified", block.timestamp, _verificationNote, msg.sender)
        );

        emit ProductVerified(_productId, msg.sender);
    }

    function updateStatus(uint256 _productId, string memory _status, string memory _note) public {
        require(products[_productId].currentOwner == msg.sender, "Not the current owner");

        trackingHistory[_productId].push(
            TrackingInfo(msg.sender, _status, block.timestamp, _note, msg.sender)
        );

        emit StatusUpdated(_productId, _status);
    }

    function getProduct(uint256 _productId) public view returns (
        uint256 id,
        string memory name,
        string memory description,
        uint256 price,
        address manufacturer,
        address currentOwner,
        uint256 timestamp,
        bool isAvailable,
        bool isVerified,
        address[] memory verifiers
    ) {
        Product memory product = products[_productId];
        return (
            product.id,
            product.name,
            product.description,
            product.price,
            product.manufacturer,
            product.currentOwner,
            product.timestamp,
            product.isAvailable,
            product.isVerified,
            product.verifiers
        );
    }

    function getTrackingHistory(uint256 _productId) public view returns (TrackingInfo[] memory) {
        return trackingHistory[_productId];
    }

    function getTransactions(uint256 _productId) public view returns (Transaction[] memory) {
        return transactions[_productId];
    }
} 