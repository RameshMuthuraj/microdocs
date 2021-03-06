package com.example.service.product.controller;

import com.example.service.product.domain.Product;
import com.example.service.product.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller for handling all products endpoints
 * @author Steven Hermans (s.hermans@maxxton.com)
 */
@RestController
@RequestMapping("/api/v1/products")
public class ProductController {

    @Autowired
    private ProductService productService;

    /**
     * Request a page of products
     * @response 200
     * @return Page of products
     */
    @RequestMapping(path = "", method = RequestMethod.GET)
    public List<Product> getProducts(){
        return productService.getProducts();
    }

    /**
     * Get a specific product by id
     * @param productId id of the product
     * @response 200
     * @response 404 if product doesn't exists
     * @return the product or null
     */
    @RequestMapping(path = "/{productId}", method=RequestMethod.GET)
    public ResponseEntity<Product> getCustomer(@PathVariable("productId") Long productId){
        Product product = productService.getProduct(productId);
        if(product != null){
            return new ResponseEntity<Product>(product, HttpStatus.OK);
        }
        return new ResponseEntity<Product>(HttpStatus.NOT_FOUND);
    }

    /**
     * Create new product
     * @param product new product
     * @response 201 product is created
     * @response 409 product with the same email already exists
     * @return The created product
     */
//    @RequestMapping(path = "", method = RequestMethod.POST)
//    public ResponseEntity<Product> createProduct(@RequestBody Product product){
//        Product newProduct = productService.createProduct(product);
//        if(newProduct != null){
//            return new ResponseEntity<Product>(newProduct, HttpStatus.CREATED);
//        }else{
//            return new ResponseEntity<Product>(HttpStatus.CONFLICT);
//        }
//    }

    /**
     * Delete product by id
     * @param productId id of the product
     * @response 200 the product is removed
     * @response 404 the product did not exists
     */
//    @RequestMapping(path = "/{productId}", method = RequestMethod.DELETE)
//    public ResponseEntity removeProduct(@PathVariable("productId") Long productId){
//        boolean succeed = productService.removeProduct(productId);
//        if(succeed){
//            return new ResponseEntity(HttpStatus.OK);
//        }else{
//            return new ResponseEntity(HttpStatus.NOT_FOUND);
//        }
//    }



}
