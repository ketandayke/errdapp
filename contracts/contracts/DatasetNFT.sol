// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract DatasetNFT is ERC1155, Ownable {
    address public marketplaceAddress;

    event DatasetCreated(uint256 indexed tokenId);

    constructor() ERC1155("") {} // URI is managed externally by the Marketplace

    modifier onlyMarketplace() {
        require(msg.sender == marketplaceAddress, "Only Marketplace can call");
        _;
    }

    function setMarketplaceAddress(address _marketplaceAddress) external onlyOwner {
        require(marketplaceAddress == address(0), "Marketplace already set");
        marketplaceAddress = _marketplaceAddress;
    }

    function mintAccess(address to, uint256 tokenId) external onlyMarketplace {
        _mint(to, tokenId, 1, ""); // Mints exactly one access token
    }
    
    function createDataset(uint256 tokenId) external onlyMarketplace {
        emit DatasetCreated(tokenId);
    }

    // This function is overridden to explicitly state that the URI is managed
    // by the marketplace, prompting the correct frontend implementation.
    function uri(uint256) public view virtual override returns (string memory) {
        return "Metadata is managed by the Marketplace contract. Please query it directly.";
    }
}