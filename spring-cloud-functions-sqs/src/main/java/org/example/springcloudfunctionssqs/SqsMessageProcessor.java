package org.example.springcloudfunctionssqs;

import io.awspring.cloud.sqs.annotation.SqsListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.function.context.FunctionCatalog;
import org.springframework.stereotype.Service;

import java.util.function.Function;

@Service
public class SqsMessageProcessor {

	@Autowired
	private FunctionCatalog functionCatalog;

	@SqsListener("test-sqs")
	public void receiveMessage(String message) {
		System.out.println("Received message: " + message);

		// Call the business logic function
		Function<String, Void> function = functionCatalog.lookup(Function.class, "sqsFunction");
		var result = function.apply(message);

		System.out.println("Function result: " + result);
	}
}
